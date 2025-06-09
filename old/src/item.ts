type Location = 'hat' | 'left' | 'right';
export class Item {
  constructor(
    public id: string,
    public name: string,
    public icon: string,
    public price: number,
    public location: Location,
  ) {}
}
