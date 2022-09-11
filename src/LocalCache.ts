import { GetResponse } from './CacheClient';

export class LocalCache {
  private _cache: { [key: string]: any } = {};
  public get(key: string): any {
    const keys = key.split('.');
    let current = this._cache;
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    return new GetResponse(current[keys[keys.length - 1]]);
  }
  public set(key: string, value: any): void {
    const keys = key.split('.');
    let current = this._cache;
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
  }
  public delete(key: string): void {
    const keys = key.split('.');
    let current = this._cache;
    for(let i = 0; i < keys.length - 1; i++)
      current[keys[i]] === undefined ? current[keys[i]] = {} : current = current[keys[i]];
    delete current[keys[keys.length - 1]];
  }
  public fetchAll(): { [key: string]: any } {
    return this._cache;
  }
}