namespace app {
    const RATIO = 1920/1080;

    interface Image {
        name: string;
        time: number;
    }

    class Model {
        public listener: (model: Model, image: Image) => void;

        public constructor(
            public images: Image[],
            private url: string,
            private n: number,
            private period: number) {
            setInterval(() => {
                this.reload();
            }, period);
        }

        private reload() {
            Model.getImages(this.url, this.n).then((images) => {
                let current = this.images[0],
                    toshow = [];
                for (let i = 0, n = images.length; i < n; i++) {
                    if (images[i].time == current.time) {
                        break;
                    }

                    toshow.unshift(images[i]);
                }

                toshow.forEach((image) => {
                    if (this.listener) {
                        this.listener(this, image);
                    }
                    this.images.unshift(image);
                });
            });
        }

        private static getImages(url: string, n: number): Promise<Image[]> {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    let images = JSON.parse(xhr.responseText);
                    resolve(images);
                };
                xhr.onerror = () => {
                    reject();
                };
                xhr.open('GET', url + '?n=' + n);
                xhr.send();
            });
        }

        public static load(url: string, n: number, period: number): Promise<Model> {
            return Model.getImages(url, n).then((images: Image[]) => {
                return new Model(images, url, n, period);
            });
        }
    }

    class View {
        public constructor(public model: Model) {
            let root = document.querySelector('#root');

            model.listener = (model, image) => {
                console.log(image);
                let el = View.viewFor(image);
                View.setSize(el, window.innerWidth, 0);
                root.insertBefore(el, root.firstElementChild);
                setTimeout(() => {
                    View.setSize(
                        el,
                        window.innerWidth,
                        window.innerWidth/RATIO);
                }, 0);
            };

            model.images.forEach((image) => {
                let el = View.viewFor(image);
                View.setSize(
                    el,
                    window.innerWidth,
                    window.innerWidth/RATIO);
                root.appendChild(el);
            });

            window.addEventListener('resize', () => {
                let els = document.querySelectorAll('.photo');
                for (let i = 0, n = els.length; i < n; i++) {
                    View.setSize(
                        <HTMLElement>els[i],
                        window.innerWidth,
                        window.innerWidth/RATIO);

                }
            }, false);
        }

        private static setSize(el: HTMLElement, w: number, h: number) {
            let style = el.style;
            style.setProperty('width', w + 'px', '');
            style.setProperty('height', h + 'px', '');
        }

        private static viewFor(image: Image): HTMLElement {
            let el = document.createElement('div');
            el.classList.add('photo');
            el.style.setProperty('background-image', 'url(' + image.name + ')', '');
            return el;
        }
    }

    Model.load('/imgs/', 20, 10000).then((model) => {
        new View(model);
    });
}