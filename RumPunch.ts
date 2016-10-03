

namespace RumPunch {
    export const PARENT_VM: string = "$parentVM";
    export const CONTEXT: string = "$context";
    export const COMPONENT_TEMPLATE_SUFFIX = "-template";
    export const COMPONENT_VM_SUFFIX = "-vm";

    class Ingredient<T> {
        public Cache: boolean
        constructor(public Key: string, public DependencyParameterKeys: string[], public Flavor: (...args: any[]) => T,
            cache?: boolean) {
            if (cache == null || cache == undefined) {
                cache = false;
            }
        }
    }

    export class Shaker {

        private _dict: any = {};  //object as dictionary
        private _cache: any = {}; //object for cached factory objects

        constructor() {
            //default constructor for the shaker injector
           
        }
        
        public Contains(key: string) : boolean{
            return this._dict[key] != null;
        }

        public Mix<T>(key: string, dependencyParameterKeys: string[], flavor: (...args: any[]) => T, cache?: boolean) {
            this._dict[key] = new Ingredient<T>(key, dependencyParameterKeys, flavor, cache);
        }

        public Pour<T>(key: string): T {
            if (this._dict[key] == null)
                throw new Error(`No factory has been registered with key '${key}'`);

            var ingredient = this._dict[key] as Ingredient<T>;

            if (this._cache[key] != null && ingredient.Cache) {
                return this._cache[key] as T;
            }


            if (ingredient.DependencyParameterKeys.length == 0) {
                this._cache[key] = ingredient.Flavor();
                return this._cache[key];
            }

            var parameters = [];

            for (var x = 0; x < ingredient.DependencyParameterKeys.length; x++) {
                parameters.push(this.Pour<any>(ingredient.DependencyParameterKeys[x]));
            }

            this._cache[key] = ingredient.Flavor.apply(null, parameters);
            return this._cache[key];


        }

    }

    export var Instance: Shaker = new Shaker();

    export function RegisterComponentLoader(ko: any) {
        var RumPunchComponentLoader = {
            getConfig: function (name, callback) {
                callback({
                    template: Instance.Pour<any>(`${name}${COMPONENT_TEMPLATE_SUFFIX}`),
                    viewModel: `${name}${COMPONENT_VM_SUFFIX}`
                });
            },
            loadViewModel: function (name, viewModelConfig, callback) {
                callback((params: any, componentInfo: any) => {
                    Instance.Mix(PARENT_VM, [], () => { return (<any>ko).dataFor(componentInfo.element); }, false);
                    Instance.Mix(CONTEXT, [], () => { return (<any>ko).contextFor(componentInfo.element); }, false);
                    return Instance.Pour<any>(viewModelConfig);
                });
            }
        };
        ko.components.loaders.unshift(RumPunchComponentLoader);
    }
}