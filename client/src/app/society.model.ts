export interface Society {
  _id: string;
  name: string;
  email: string;
  imageUrl: string;
  address: string;
  phoneNumber: string;
  regNo: string;
  approved: boolean;
  isLoading: boolean;
  month_fee: {
    description: string;
    amount: number;
  };
  current_income: number;
  expected_income: number;
  number_of_members: number;
}
