var app;
(function (app) {
    var RATIO = 1920 / 1080;
    var Model = /** @class */ (function () {
        function Model(images, url, n, period) {
            var _this = this;
            this.images = images;
            this.url = url;
            this.n = n;
            this.period = period;
            setInterval(function () {
                _this.reload();
            }, period);
        }
        Model.prototype.reload = function () {
            var _this = this;
            Model.getImages(this.url, this.n).then(function (images) {
                var current = _this.images[0], toshow = [];
                for (var i = 0, n = images.length; i < n; i++) {
                    if (images[i].time == current.time) {
                        break;
                    }
                    toshow.unshift(images[i]);
                }
                toshow.forEach(function (image) {
                    if (_this.listener) {
                        _this.listener(_this, image);
                    }
                });
            });
        };
        Model.getImages = function (url, n) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var images = JSON.parse(xhr.responseText);
                    resolve(images);
                };
                xhr.onerror = function () {
                    reject();
                };
                xhr.open('GET', url + '?n=' + n);
                xhr.send();
            });
        };
        Model.load = function (url, n, period) {
            return Model.getImages(url, n).then(function (images) {
                return new Model(images, url, n, period);
            });
        };
        return Model;
    }());
    var View = /** @class */ (function () {
        function View(model) {
            this.model = model;
            var root = document.querySelector('#root');
            model.listener = function (model, image) {
                console.log(image);
                var el = View.viewFor(image);
                View.setSize(el, window.innerWidth, 0);
                root.insertBefore(el, root.firstElementChild);
                setTimeout(function () {
                    View.setSize(el, window.innerWidth, window.innerWidth / RATIO);
                }, 0);
            };
            model.images.forEach(function (image) {
                var el = View.viewFor(image);
                View.setSize(el, window.innerWidth, window.innerWidth / RATIO);
                root.appendChild(el);
            });
            window.addEventListener('resize', function () {
                var els = document.querySelectorAll('.photo');
                for (var i = 0, n = els.length; i < n; i++) {
                    View.setSize(els[i], window.innerWidth, window.innerWidth / RATIO);
                }
            }, false);
        }
        View.setSize = function (el, w, h) {
            var style = el.style;
            style.setProperty('width', w + 'px', '');
            style.setProperty('height', h + 'px', '');
        };
        View.viewFor = function (image) {
            var el = document.createElement('div');
            el.classList.add('photo');
            el.style.setProperty('background-image', 'url(' + image.name + ')', '');
            return el;
        };
        return View;
    }());
    Model.load('/imgs/', 20, 10000).then(function (model) {
        new View(model);
    });
})(app || (app = {}));
