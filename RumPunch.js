var RumPunch;
(function (RumPunch) {
    var Ingredient = (function () {
        function Ingredient(Key, DependencyParameterKeys, Bottle, cache) {
            this.Key = Key;
            this.DependencyParameterKeys = DependencyParameterKeys;
            this.Bottle = Bottle;
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
        Shaker.prototype.Mix = function (key, dependencyParameterKeys, factory, cache) {
            this._dict[key] = new Ingredient(key, dependencyParameterKeys, factory, cache);
        };
        Shaker.prototype.Pour = function (key) {
            if (this._dict[key] == null)
                throw new Error("No factory has been registered with key '" + key + "'");
            var ingredient = this._dict[key];
            if (this._cache[key] != null && ingredient.Cache) {
                return this._cache[key];
            }
            if (ingredient.DependencyParameterKeys.length == 0) {
                this._cache[key] = ingredient.Bottle();
                return this._cache[key];
            }
            var parameters = [];
            for (var x = 0; x < ingredient.DependencyParameterKeys.length; x++) {
                parameters.push(this.Pour(ingredient.DependencyParameterKeys[x]));
            }
            this._cache[key] = ingredient.Bottle.apply(null, parameters);
            return this._cache[key];
        };
        return Shaker;
    })();
    RumPunch.Shaker = Shaker;
    RumPunch.Instance = new Shaker();
    function RegisterComponentLoader(ko) {
        var RumPunchComponentLoader = {
            getConfig: function (name, callback) {
                callback({ template: RumPunch.Instance.Pour(name + "-template"), viewModel: name + "-vm" });
            },
            loadViewModel: function (name, viewModelConfig, callback) {
                callback(function (params, componentInfo) {
                    RumPunch.Instance.Mix('$parentVM', [], function () { return ko.dataFor(componentInfo.element); }, false);
                    return RumPunch.Instance.Pour(viewModelConfig);
                });
            }
        };
        ko.components.loaders.unshift(RumPunchComponentLoader);
    }
    RumPunch.RegisterComponentLoader = RegisterComponentLoader;
})(RumPunch || (RumPunch = {}));
//# sourceMappingURL=RumPunch.js.map