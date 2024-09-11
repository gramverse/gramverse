import {BRAND} from "zod";

export type Brand<A, K extends string> = A & BRAND<K>;
