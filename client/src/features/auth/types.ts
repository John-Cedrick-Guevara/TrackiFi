export interface SignIn {
    email: string;
    password: string;
}

export interface SignUp {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  // Step 2
  occupation: string;
  incomeSource: string;
  // Step 3
  goalType: string;
  targetAmount: string;
  startDate: string;
  endDate: string;
}