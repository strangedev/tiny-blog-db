import 'babel-polyfill';
import {all} from "./view";
import * as Future from "fluture";
import * as MongoDb from "mongodb";
import * as R from "ramda";
import {insert, remove} from "../BlogEntry/mutation";
import {BlogEntry} from "tiny-blog-model";
import {ObjectId} from "mongodb";

beforeAll(async () => {
    global.getDb = () => Future.Future((reject, resolve) => {
        let client = MongoDb.MongoClient(global.__MONGO_URI__);

        function closeWith(value) {
            return Future.tryP(
                () => client.close()
            ).map(
                () => value
            );
        }

        client.connect(
            err => {
                if (R.isNil(err)) {
                   resolve({
                       db: client.db("jest"),
                       closeWith
                   });
                } else {
                    reject(err);
                }
        });
    });
});

test("view.all", () => {
    let allFn = all(global.getDb);
    let insertFn = insert(global.getDb);
    let removeFn = remove(global.getDb);
    let blogEntry = new BlogEntry(
        undefined,
        "Title",
        "Content",
        "Author",
        Date.now(),
        ["tag"]
    );
    let future = allFn().chain(
        tags => {
            expect(tags).toHaveLength(0);
            return insertFn(blogEntry);
        }
    ).chain(
        insertedId => {
            expect(insertedId).toBeInstanceOf(ObjectId);
            return allFn().chain(
                tags => {
                    expect(tags).toEqual(["tag"]);
                    return removeFn({id: insertedId});
                }
            )
        }
    );
    return expect(future.promise()).resolves.toBe(1);
});