const { 
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const get = require("lodash.get");

const handler = async (event) => {
  try {
    const noteName = get(event, "pathParameters.id");
    const bucketName = process.env.BUCKET;
    console.log('bucketName: ', bucketName);

    const S3 = new S3Client({});

    // GET all notes
    if (event.routeKey === "GET /notes") {
      const data = await S3.send(new ListObjectsV2Command({ Bucket: bucketName }));
      if (!data.Contents) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: [] })
        }
      }

      const body = {
        notes: data.Contents.map(function(e) { return e.Key })
      };
      console.log("body: ", body);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      };
    }

    else if (event.routeKey === "GET /notes/{id}") {
      // GET /name to get info on note name
      const headObjectResponse = await S3.send(new HeadObjectCommand({
        Bucket: bucketName, Key: noteName
      }));

      const {
        ContentLength,
        ContentType,
        ETag,
        LastModified,
        StorageClass,
        ServerSideEncryption,
        VersionId,
        Metadata, // Custom metadata headers
      } = headObjectResponse;

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ContentLength,
          ContentType,
          ETag,
          LastModified,
          StorageClass,
          ServerSideEncryption,
          VersionId,
          Metadata,
        }),
      };
    }

    else if (event.routeKey === "POST /notes/{id}") {
      // POST /name
      // Return error if we do not have a name
      if (!noteName) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
          },
          body: "note name missing"
        };
      }

      // Create some dummy data to populate object
      const now = new Date();
      const data = noteName + " created: " + now;

      const base64data = Buffer.from(data, 'binary');

      await S3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: noteName,
        Body: base64data,
        ContentType: 'application/json'
      }));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data
      };
    }

    if (event.routeKey === "DELETE /notes/{id}") {
      // DELETE /name
      // Return an error if we do not have a name
      if (!noteName) {
        return {
          statusCode: 400,
          headers: {},
          body: "note name missing"
        };
      }

      await S3.send(new DeleteObjectCommand({
        Bucket: bucketName, Key: noteName
      }));

      return {
        statusCode: 200,
        headers: {},
        body: "Successfully deleted note " + noteName
      };
    }

    // We got something besides a GET, POST, or DELETE
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET, POST, and DELETE, not " + method
    };
  } catch(error) {
    var body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: body
    }
  }
};

module.exports = { handler };