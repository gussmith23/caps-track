export class Player {
  constructor(
    public id: string,
    public name: string,
    public nameColor: string,
    public fontId: string,
    public fontWeight: string,
    public unlockedItemIds: [string],
    public equippedItemIds: [string],
  ) {}
}
