import {NextResponse} from "next/server";
export function middleware(){const r=NextResponse.next();r.headers.set("Cache-Control","private, no-store, max-age=0");r.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");r.headers.set("Referrer-Policy","no-referrer");r.headers.set("X-Content-Type-Options","nosniff");r.headers.set("X-Frame-Options","DENY");return r;}
export const config={matcher:["/story/:path*","/api/:path*"]};
