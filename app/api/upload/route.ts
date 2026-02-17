
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize outside to allow reuse, but we'll check validity inside
const getS3Client = () => {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    // console.log("Debug S3 Config:", { region, hasAccessKey: !!accessKeyId, hasSecret: !!secretAccessKey });

    if (!accessKeyId || !secretAccessKey) {
        throw new Error("AWS Credentials are missing from environment variables.");
    }

    return new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const s3Client = getS3Client();

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "File is required." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueFilename,
            Body: buffer,
            ContentType: file.type,
            // ACL: "public-read", // Uncomment if your bucket supports ACLs and you need it public
        });

        await s3Client.send(command);

        const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;

        return NextResponse.json({ success: true, url: publicUrl, filename: uniqueFilename });

    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
