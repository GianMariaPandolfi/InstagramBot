"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var instagram_mqtt_1 = require("instagram_mqtt");
var instagram_private_api_1 = require("instagram-private-api");
var util_1 = require("util");
var fs_1 = require("fs");
var Bluebird = require("bluebird");
var inquirer = require("inquirer");
var writeFileAsync = util_1.promisify(fs_1.writeFile);
var readFileAsync = util_1.promisify(fs_1.readFile);
var existsAsync = util_1.promisify(fs_1.exists);
var _a = require("./config"), username = _a.username, password = _a.password;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var ig;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ig = instagram_mqtt_1.withFbns(new instagram_private_api_1.IgApiClient());
                ig.state.generateDevice(username);
                // this will set the auth and the cookies for instagram
                return [4 /*yield*/, readState(ig)];
            case 1:
                // this will set the auth and the cookies for instagram
                _a.sent();
                // this logs the client in
                return [4 /*yield*/, loginToInstagram(ig)];
            case 2:
                // this logs the client in
                _a.sent();
                // Example: listen to direct-messages
                // 'direct_v2_message' is emitted whenever anything gets sent to the user
                ig.fbns.on('direct_v2_message', logEvent('direct-message'));
                // 'push' is emitted on every push notification
                ig.fbns.on('push', logEvent('push'));
                // 'auth' is emitted whenever the auth is sent to the client
                ig.fbns.on('auth', function (auth) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // logs the auth
                                logEvent('auth')(auth);
                                //saves the auth
                                return [4 /*yield*/, saveState(ig)];
                            case 1:
                                //saves the auth
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                // 'error' is emitted whenever the client experiences a fatal error
                ig.fbns.on('error', logEvent('error'));
                // 'warning' is emitted whenever the client errors but the connection isn't affected
                ig.fbns.on('warning', logEvent('warning'));
                // this sends the connect packet to the server and starts the connection
                return [4 /*yield*/, ig.fbns.connect()];
            case 3:
                // this sends the connect packet to the server and starts the connection
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
function saveState(ig) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = writeFileAsync;
                    _b = ['state.json'];
                    return [4 /*yield*/, ig.exportState()];
                case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), { encoding: 'utf8' }]))];
            }
        });
    });
}
function readState(ig) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, existsAsync('state.json')];
                case 1:
                    if (!(_c.sent()))
                        return [2 /*return*/];
                    _b = (_a = ig).importState;
                    return [4 /*yield*/, readFileAsync('state.json', { encoding: 'utf8' })];
                case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function loginToInstagram(ig) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ig.request.end$.subscribe(function () { return saveState(ig); });
                    return [4 /*yield*/, Bluebird["try"](function () { return ig.account.login(username, password); })["catch"](instagram_private_api_1.IgCheckpointError, function () { return __awaiter(_this, void 0, void 0, function () {
                            var code, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        console.log(ig.state.checkpoint); // Checkpoint info here
                                        return [4 /*yield*/, ig.challenge.auto(true)];
                                    case 1:
                                        _c.sent(); // Requesting sms-code or click "It was me" button
                                        console.log(ig.state.checkpoint); // Challenge info here
                                        return [4 /*yield*/, inquirer.prompt([
                                                {
                                                    type: 'input',
                                                    name: 'code',
                                                    message: 'Enter code'
                                                },
                                            ])];
                                    case 2:
                                        code = (_c.sent()).code;
                                        _b = (_a = console).log;
                                        return [4 /*yield*/, ig.challenge.sendSecurityCode(code)];
                                    case 3:
                                        _b.apply(_a, [_c.sent()]);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * A wrapper function to log to the console
 * @param name
 * @returns {(data) => void}
 */
function logEvent(name) {
    return function (data) { return console.log(name, data); };
}
