"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
var typeorm_1 = require("typeorm");
var Product = /** @class */ (function () {
    function Product() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)()
    ], Product.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: String })
    ], Product.prototype, "title", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: String })
    ], Product.prototype, "image", void 0);
    __decorate([
        (0, typeorm_1.Column)({ default: 0, type: Number })
    ], Product.prototype, "likes", void 0);
    Product = __decorate([
        (0, typeorm_1.Entity)()
    ], Product);
    return Product;
}());
exports.Product = Product;
