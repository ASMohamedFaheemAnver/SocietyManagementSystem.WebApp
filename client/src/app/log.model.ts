export interface Log {
  _id: string;
  kind: string;
  fee: {
    amount: number;
    description: string;
    _id: string;
    date: string;
  };
}
