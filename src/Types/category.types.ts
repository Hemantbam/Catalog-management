export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  children: Category[];
};

export type CategoryInput = {
  id: string | null;
  name: string;
};
