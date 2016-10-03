declare namespace RumPunch {
    const PARENT_VM: string;
    const CONTEXT: string;
    const COMPONENT_TEMPLATE_SUFFIX: string;
    const COMPONENT_VM_SUFFIX: string;
    class Shaker {
        private _dict;
        private _cache;
        constructor();
        Contains(key: string): boolean;
        Mix<T>(key: string, dependencyParameterKeys: string[], flavor: (...args: any[]) => T, cache?: boolean): void;
        Pour<T>(key: string): T;
    }
    var Instance: Shaker;
    function RegisterComponentLoader(ko: any): void;
}
