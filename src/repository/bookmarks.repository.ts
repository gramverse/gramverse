import { Model } from "mongoose";
import { bookmarkSchema } from "../models/bookmark/bookmark-schema";
import { IBookmark, Bookmark } from "../models/bookmark/bookmark";

export  class BookmarksRepository {
    private bookmarks: Model<IBookmark>;
    constructor(private datahandler: typeof import ("mongoose")) {
        this.bookmarks = datahandler.model<IBookmark>("bookmarks", bookmarkSchema);
    }
    add = async (bookmark: Bookmark) => {
        const createdBookmark = (await this.bookmarks.create(bookmark));
        if (!createdBookmark) {
            return undefined;
        }
        const newBookmark: Bookmark = createdBookmark;
        return newBookmark;
    }
}