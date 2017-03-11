class Obj {
	constructor(obj, cb) {
		if (!Obj.isObj(obj)) {
			throw `This parameter must be an object：${obj}`;
		}
		if (!Obj.isFunc(cb)) {
			throw `This parameter must be a function: ${cb}`;
		}
		this.cb = cb;
		this.observe(obj);
	}

	observe(obj, path = []) {
		Object.keys(obj).forEach((key) => {
			let _val = obj[key];
			let _path = path.slice(0);
			_path.push(key);
			if (Array.isArray(_val)) {
				this.handleArray(_val, _path);
			}
			Object.defineProperty(obj, key, {
				get() {
					return _val;
				},
				set: (function(newVal) {
					_val = this.cb(newVal, _val, _path);
					this.observe(_val, _path);
				}.bind(this))
			})
			if (Obj.isObj(_val) || Array.isArray(_val)) {
				this.observe(_val, _path);
			}
		})
	}

	handleArray(arr, path) {
		const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
		const arrProto = Array.prototype;
		const newArrProto = Object.create(arrProto);
		const self = this;
		methods.forEach((method) => {
			Object.defineProperty(newArrProto, method, {
				value: function(...args) {
					let oldArr = this.slice(0);
					let res = arrProto[method].apply(this, args);
					self.observe(this, path);
					self.cb(this, oldArr, path);
					return res;
				},
				writable: true,
				enumerable: false,
				configurable: true
			})
		})
		Object.setPrototypeOf(arr, newArrProto);
	}

	static isFunc(obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	}

	static isObj(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

}

