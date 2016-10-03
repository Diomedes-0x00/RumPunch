var RumPunch;
(function (RumPunch) {
    RumPunch.PARENT_VM = "$parentVM";
    RumPunch.COMPONENT_TEMPLATE_SUFFIX = "-template";
    RumPunch.COMPONENT_VM_SUFFIX = "-vm";
    var Ingredient = (function () {
        function Ingredient(Key, DependencyParameterKeys, Flavor, cache) {
            this.Key = Key;
            this.DependencyParameterKeys = DependencyParameterKeys;
            this.Flavor = Flavor;
            if (cache == null || cache == undefined) {
                cache = false;
            }
        }
        return Ingredient;
    })();
    var Shaker = (function () {
        function Shaker() {
            //default constructor for the shaker injector
            this._dict = {}; //object as dictionary
            this._cache = {}; //object for cached factory objects
        }
        Shaker.prototype.Contains = function (key) {
            return this._dict[key] != null;
        };
        Shaker.prototype.Mix = function (key, dependencyParameterKeys, flavor, cache) {
            this._dict[key] = new Ingredient(key, dependencyParameterKeys, flavor, cache);
        };
        Shaker.prototype.Pour = function (key) {
            if (this._dict[key] == null)
                throw new Error("No factory has been registered with key '" + key + "'");
            var ingredient = this._dict[key];
            if (this._cache[key] != null && ingredient.Cache) {
                return this._cache[key];
            }
            if (ingredient.DependencyParameterKeys.length == 0) {
                this._cache[key] = ingredient.Flavor();
                return this._cache[key];
            }
            var parameters = [];
            for (var x = 0; x < ingredient.DependencyParameterKeys.length; x++) {
                parameters.push(this.Pour(ingredient.DependencyParameterKeys[x]));
            }
            this._cache[key] = ingredient.Flavor.apply(null, parameters);
            return this._cache[key];
        };
        return Shaker;
    })();
    RumPunch.Shaker = Shaker;
    RumPunch.Instance = new Shaker();
    function RegisterComponentLoader(ko) {
        var RumPunchComponentLoader = {
            getConfig: function (name, callback) {
                callback({
                    template: RumPunch.Instance.Pour("" + name + RumPunch.COMPONENT_TEMPLATE_SUFFIX),
                    viewModel: "" + name + RumPunch.COMPONENT_VM_SUFFIX
                });
            },
            loadViewModel: function (name, viewModelConfig, callback) {
                callback(function (params, componentInfo) {
                    RumPunch.Instance.Mix(RumPunch.PARENT_VM, [], function () { return ko.dataFor(componentInfo.element); }, false);
                    return RumPunch.Instance.Pour(viewModelConfig);
                });
            }
        };
        ko.components.loaders.unshift(RumPunchComponentLoader);
    }
    RumPunch.RegisterComponentLoader = RegisterComponentLoader;
})(RumPunch || (RumPunch = {}));
//# sourceMappingURL=RumPunch.js.map