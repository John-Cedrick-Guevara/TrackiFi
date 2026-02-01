// apps/web/src/features/auth/useAuth.ts
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useSupabase } from "@/providers";
import type { SignUp } from "../types";

export const useAuth = () => {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const signUp = async (formData: SignUp, metadata: any) => {
    try {
      // 1. Sign up
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: formData }, // optional
      });
      if (error) throw error;

      // 2. Insert into users table
      if (signUpData.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          contact_number: formData.contactNumber,
          occupation: formData.occupation,
          income_source: formData.incomeSource,
        });
        console.log(insertError);
        if (insertError) throw insertError;
      }

      // 3. insert goal into goals table
      if (signUpData.user) {
        const { error: insertError } = await supabase.from("goals").insert({
          user_id: signUpData.user.id,
          type: formData.goalType,
          target_amount: formData.targetAmount,
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: "active",
          metadata,
        });
        console.log(insertError);
        if (insertError) throw insertError;
      }

      setUser(signUpData.user);
      return signUpData;
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
};
