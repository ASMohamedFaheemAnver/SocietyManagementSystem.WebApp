export interface Log {
  _id: string;
  kind: string;
  fee: {
    amount: number;
    description: string;
    _id: string;
    date: string;
    tracks: {
      _id: string;
      is_paid: boolean;
      member: {
        _id: string;
        name: string;
        imageUrl: string;
      };
    }[];
  };
}
