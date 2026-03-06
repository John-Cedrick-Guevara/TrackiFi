export interface Goal {
    uuid: string;
    user_id: string;
    name: string;
    amount: number;
    description: string;
    type: "saving" | "spending";
    end_date: Date;
    start_date: Date;
    created_at: Date;
    updated_at: Date;
}


export interface CreateGoalPayload {
    user_id: string;
    name: string;
    amount: number;
    description: string;
    type: "saving" | "spending";
    end_date: Date;
    start_date: Date;
}

export interface UpdateGoalPayload {
    uuid: string;
    user_id: string;
    name?: string;
    amount?: number;
    description?: string;
    type?: "saving" | "spending";
    end_date?: Date;
    start_date?: Date;
}

export interface exponentialSmoothingParams {
    alpha: number;
    beta: number;
    monthlyData: { year: number; month: number; amount: number }[];
    goalAmount: number;
    currentAmount: number;
    
}