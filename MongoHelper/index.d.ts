export declare function Insert(value: any, collectionName: string): Promise<string|any>;
export declare function InsertMany(value: any[], collectionName: string): Promise<any>;

export declare function getUser(username: string, collectionName: string): Promise<any>;

export declare function availableUsername(username: string, collectionName: string): Promise<boolean>;
