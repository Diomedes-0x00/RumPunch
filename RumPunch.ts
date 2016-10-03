

namespace RumPunch {

    class Ingredient<T> {
        public Cache: boolean
        constructor(public Key: string, public DependencyParameterKeys: string[], public Bottle: (...args: any[]) => T,
            cache?: boolean) {
            if (cache == null || cache == undefined) {
                cache = false;
            }
        }
    }

    export class Shaker {

        _dict: any;  //object as dictionary
        _cache: any; //object for cached factory objects

        constructor() {
            //default constructor for the shaker injector
            this._dict = {};
            this._cache = {};
        }

        public Mix<T>(key: string, dependencyParameterKeys: string[], factory: (...args: any[]) => T, cache?: boolean) {
            this._dict[key] = new Ingredient<T>(key, dependencyParameterKeys, factory, cache);
        }

        public Pour<T>(key: string): T {
            if (this._dict[key] == null)
                throw new Error(`No factory has been registered with key '${key}'`);

            var ingredient = this._dict[key] as Ingredient<T>;

            if (this._cache[key] != null && ingredient.Cache) {
                return this._cache[key] as T;
            }


            if (ingredient.DependencyParameterKeys.length == 0) {
                this._cache[key] = ingredient.Bottle();
                return this._cache[key];
            }

            var parameters = [];

            for (var x = 0; x < ingredient.DependencyParameterKeys.length; x++) {
                parameters.push(this.Pour<any>(ingredient.DependencyParameterKeys[x]));
            }

            this._cache[key] = ingredient.Bottle.apply(null, parameters);
            return this._cache[key];


        }

    }

    export var Instance: Shaker = new Shaker();

    export function RegisterComponentLoader(ko: any) {
        var RumPunchComponentLoader = {
            getConfig: function (name, callback) {
                debugger;
                //callback({ template: `${name}-template`, viewModel: `${name}-vm` });
                callback({ template: Instance.Pour<any>(`${name}-template`), viewModel: `${name}-vm` });
            },
            //loadTemplate: function (name, templateConfig, callback) {
            //    debugger;

            //    callback(Instance.Pour<any>(templateConfig));
            //},
            loadViewModel: function (name, viewModelConfig, callback) {
                debugger;

                callback((params: any, componentInfo: any) => {
                    Instance.Mix('$parentVM', [], () => { return (<any>ko).dataFor(componentInfo.element); }, false);
                    return Instance.Pour<any>(viewModelConfig);
                });

                
            }
        };
        ko.components.loaders.unshift(RumPunchComponentLoader);
    }
}