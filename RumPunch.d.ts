declare namespace RumPunch {
    class Shaker {
        private _dict;
        private _cache;
        constructor();
        Mix<T>(key: string, dependencyParameterKeys: string[], flavor: (...args: any[]) => T, cache?: boolean): void;
        Pour<T>(key: string): T;
    }
    var Instance: Shaker;
    function RegisterComponentLoader(ko: any): void;
}
