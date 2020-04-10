export interface Member {
  _id: string;
  email: string;
  name: string;
  imageUrl: string;
  address: string;
  arrears: number;
  approved: boolean;
  isLoading: boolean;
}
