import { S3 } from "aws-sdk";
import { variables } from "../../config/envLoader";

class Media {
    private s3: S3;

    constructor() {
        this.s3 = new S3({
            accessKeyId: variables.AWS_ACCESS_KEY_ID,
            secretAccessKey: variables.AWS_SECRET_ACCESS_KEY,
            region: variables.AWS_REGION,
        });
    }

    public uploadMedia = async (data: any) => {

        console.log("Media upload", data);
        const uploadParams = {
            Bucket: variables.AWS_BUCKET_NAME,
            Key: data.fileName,
            Body: data.file,
            ContentType: data.fileType,
            ACL: "public-read",
        };

        const a = await this.s3.upload(uploadParams).promise()
    };

}

export default Media;
