export interface Plant {
  id: string;
  parents?: [string, string];
  characteristics: { [key: string]: string };
  commonName: string;
  description: string;
}
