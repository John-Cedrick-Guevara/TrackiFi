import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "../types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useAccounts } from "@/features/savings/api";
import { Loader2, Wallet } from "lucide-react";

// zod types/resolver can have version mismatches across packages; keep schema
// but relax TypeScript checks by casting schema/resolver to `any` so runtime
// behavior remains intact while avoiding compile-time type conflicts.
const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters." }),
    target_amount: z.coerce
      .number()
      .min(1, { message: "Target amount must be greater than 0." }),
    target_date: z.date(),
  }) as any;

type FormData = any;

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Goal, "id" | "created_at" | "updated_at">) => void;
  initialData?: Goal | null;
}

export const GoalForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: GoalFormProps) => {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const savingsAccount = accounts?.find((acc) => acc.type === "savings");
  const savingsBalance = savingsAccount?.balance ?? 0;

  const form = useForm<FormData>({
    // cast resolver to any to avoid type incompatibilities between
    // @hookform/resolvers and installed zod types
    resolver: zodResolver(formSchema) as unknown as any,
    defaultValues: {
      title: initialData?.title || "",
      target_amount: initialData?.target_amount || 0,
      target_date: initialData
        ? new Date(initialData.target_date)
        : new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
  });

  // Reset the form only when the modal opens or initialData changes,
  // NOT on every render — doing it outside useEffect would clear the
  // input on every keystroke.
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: initialData?.title ?? "",
        target_amount: initialData?.target_amount ?? 0,
        target_date: initialData
          ? new Date(initialData.target_date)
          : new Date(new Date().setMonth(new Date().getMonth() + 6)),
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (values: FormData) => {
    onSubmit({
      title: values.title,
      target_amount: values.target_amount,
      current_amount: savingsBalance,
      target_date: values.target_date.toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Goal" : "Create Goal"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update your target and tracking data."
              : "Set a new specific financial goal to track."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Vacation Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border p-3 bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="font-medium">Savings Account Balance</span>
              </div>
              {accountsLoading ? (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </div>
              ) : (
                <p className="text-xl font-bold text-primary mt-1">
                  ₱{savingsBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This will be used as your starting amount.
              </p>
            </div>

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you want to reach this goal?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
