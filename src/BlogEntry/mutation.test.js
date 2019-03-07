import 'babel-polyfill';
import {insert, remove} from "./mutation";
import {BlogEntry} from "tiny-blog-model";
import * as Future from "fluture";
import * as R from "ramda";
import * as MongoDb from "mongodb";
import {ObjectId} from "mongodb";
import {newest} from "./view";
import {all} from "../Tag/view";

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

test("mutation.insert", () => {
    let insertFn = insert(global.getDb);
    let newestFn = newest(global.getDb);
    let removeFn = remove(global.getDb);
    let blogEntry = new BlogEntry(
        undefined,
        "Title",
        "Content",
        "Author",
        Date.now(),
        ["tag"]
    );
    let future = newestFn(0, 50).chain(
        newest => {
            expect(newest).toHaveLength(0);
            return insertFn(blogEntry);
        }
    ).chain(
        insertedId => {
            expect(insertedId).toBeInstanceOf(ObjectId);
            return removeFn({id: insertedId});
        }
    ).chain(
        removedCount => {
            expect(removedCount).toBe(1);
            return newestFn(0, 50);
        }
    );
    return expect(future.promise()).resolves.toHaveLength(0);
});

test("mutation.remove", async () => {
    let insertFn = insert(global.getDb);
    let removeFn = remove(global.getDb);
    let newestFn = newest(global.getDb);
    let tagFn = all(global.getDb);
    let blogEntry = new BlogEntry(
        undefined,
        "Title",
        "Content",
        "Author",
        Date.now(),
        ["tag", "blumentopferde", "giraffentorte"]
    );
    let future = insertFn(blogEntry).chain(
        insertedId => {
            expect(insertedId).toBeInstanceOf(ObjectId);
            return removeFn({id: insertedId});
        }
    ).chain(
        removedCount => {
            expect(removedCount).toBe(1);
            return newestFn(0, 50);
        }
    ).chain(
        newest => {
            expect(newest).toHaveLength(0);
            return tagFn();
        }
    );
    return expect(future.promise()).resolves.toHaveLength(0);

});