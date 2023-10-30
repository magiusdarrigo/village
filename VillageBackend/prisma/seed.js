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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("../src/clients/prismaClient"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const sleep = (ms) => {
            return new Promise((resolve) => setTimeout(resolve, ms));
        };
        // seed the neighborhoods table with 5 neighborhoods
        const randomNeighborhoods = Array.from({ length: 5 }).map((_, index) => {
            return prismaClient_1.default.neighborhoods.create({
                data: {
                    name: `neighborhood-${index}`,
                },
            });
        });
        yield Promise.all(randomNeighborhoods);
        // seed the buildings table with 25 buildings (5 buildings per neighborhood)
        const randomBuildings = Array.from({ length: 25 }).map((_, index) => {
            return prismaClient_1.default.buildings.create({
                data: {
                    address: `address #${index}`,
                    neighborhood_id: (index % 5) + 1,
                },
            });
        });
        yield Promise.all(randomBuildings);
        // seed the users table with 100 users (20 users per building)
        const randomUsers = Array.from({ length: 100 }).map((_, index) => {
            return prismaClient_1.default.users.create({
                data: {
                    username: `user${index}`,
                    phone_number: `+1-000-${index}`,
                    neighborhood_id: (index % 5) + 1,
                    building_id: (index % 25) + 1,
                },
            });
        });
        yield Promise.all(randomUsers);
        // seed the posts table with 500 posts (first 20 users will have 25 posts each)
        const randomPosts = Array.from({ length: 500 }).map((_, index) => {
            return () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1); // Sleep for 1 ms
                yield prismaClient_1.default.posts.create({
                    data: {
                        user_id: (index % 20) + 1,
                        neighborhood_id: (index % 5) + 1,
                        text_content: `post ${index}`,
                    },
                });
            });
        });
        for (const createPost of randomPosts) {
            yield createPost();
        }
        // seed the comments table with 50 comments (first 20 users comment on the first 5 posts)
        // so post id 1 will have 10 comments.
        const randomComments = Array.from({ length: 50 }).map((_, index) => {
            return () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1); // Sleep for 1 ms
                yield prismaClient_1.default.comments.create({
                    data: {
                        user_id: (index % 20) + 1,
                        post_id: (index % 5) + 1,
                        text_content: `comment ${index}`,
                    },
                });
            });
        });
        for (const createComment of randomComments) {
            yield createComment();
        }
        // seed the comments table with 51 replies (all on the comments of the first post, first 20 users reply to the first 5 comments)
        // so comment id 1 will have 11 replies, other comments will have 10 replies.
        const randomReplies = Array.from({ length: 51 }).map((_, index) => {
            return () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(1); // Sleep for 1 ms
                yield prismaClient_1.default.comments.create({
                    data: {
                        user_id: (index % 20) + 1,
                        post_id: 1,
                        parent_comment_id: (index % 5) + 1,
                        text_content: `reply ${index}`,
                    },
                });
            });
        });
        for (const createReply of randomReplies) {
            yield createReply();
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.$disconnect();
}));
