import {Model} from "mongoose";
import {bookmarkSchema} from "../models/bookmark/bookmark-schema";
import {IBookmark, Bookmark} from "../models/bookmark/bookmark";
import {BookmarkDto} from "../models/bookmark/bookmark-request";
import { convertType } from "../utilities/convert-type";

export class BookmarkRepository {
    private bookmarks: Model<IBookmark>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.bookmarks = datahandler.model<IBookmark>(
            "bookmarks",
            bookmarkSchema,
        );
    }

    add = async (bookmarkDto: BookmarkDto) => {
        const createdBookmark = await this.bookmarks.create(bookmarkDto);
        return createdBookmark._id;
    };

    getCountByPostId = async (postId: string) => {
        return await this.bookmarks.countDocuments({postId, isDeleted: false});
    };

    bookmarkExists = async (userName: string, postId: string) => {
        const bookmark = await this.bookmarks.findOne({
            userName,
            postId,
            isDeleted: false,
        });
        return !!bookmark;
    };

    deleteBookmark = async (userName: string, postId: string) => {
        await this.bookmarks.updateOne(
            {userName, postId},
            {isDeleted: true},
        );
    };

    undeleteBookmark = async (userName: string, postId: string) => {
        await this.bookmarks.updateOne(
            {userName, postId},
            {isDeleted: false},
        );
    };

    getBookmark = async (userName: string, postId: string) => {
        const bookmark = await this.bookmarks.findOne({userName, postId});
        return convertType<Bookmark, IBookmark>(bookmark);
    };

    getBookmarks = async (userName: string, skip: number, limit: number) => {
        const bookmarks = await this.bookmarks
            .find({ userName }) 
            .sort({ creationDate: -1 })  
            .skip(skip)  
            .limit(limit)  
            .select("postId")  
            .lean();  
    
        return bookmarks.map(bookmark => bookmark.postId);  
    }    

    getCountBookmarks = async (userName: string) => {
        return await this.bookmarks.countDocuments({userName});
    }
}