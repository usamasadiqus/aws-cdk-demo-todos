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

    const createUser = new Function(this, "CreateUserLambdaHandler", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("functions"),
      handler: "users.createUserHandler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    usersTable.grantReadWriteData(createUser);

    const updateUser = new Function(this, "UpdateUserLambdaHandler", {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset("functions"),
      handler: "users.updateUserHandler",
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    usersTable.grantReadWriteData(updateUser);

    // Create api gateway methods and path
    const api = new RestApi(this, "user-apis");

    api.root
      .resourceForPath("users")
      .addMethod("GET", new LambdaIntegration(getAllUsers));

    api.root
      .resourceForPath("users")
      .addMethod("POST", new LambdaIntegration(createUser));

    api.root
      .resourceForPath("users")
      .addResource("{id}")
      .addMethod("PUT", new LambdaIntegration(updateUser));

    new cdk.CfnOutput(this, "APIURL", {
      value: api.url ?? "Something went wrong",
    });
  }
}
