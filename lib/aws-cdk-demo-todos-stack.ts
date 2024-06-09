import * as cdk from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class AwsCdkDemoTodosStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Users Table
    const usersTable = new Table(this, "users", {
      partitionKey: { name: "id", type: AttributeType.STRING },
    });

    // Lambda Functions
    const getAllUsers = new Function(this, "GetAllUsersLambdaHandler", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("functions"),
      handler: "users.getAllUsersHandler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    usersTable.grantReadWriteData(getAllUsers);

    // Create api gateway methods and path
    const api = new RestApi(this, "user-apis");

    api.root
      .resourceForPath("users")
      .addMethod("GET", new LambdaIntegration(getAllUsers));

    new cdk.CfnOutput(this, "APIURL", {
      value: api.url ?? "Something went wrong",
    });
  }
}
