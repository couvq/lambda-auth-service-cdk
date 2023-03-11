import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuthApi } from "./auth-api";
import { ProtectedApi } from "./protected-api";
import { CognitoUserPool } from "./user-pool";

export class LambdaAuthServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const userPool = new CognitoUserPool(this, 'UserPool');

		const { userPoolId, userPoolClientId } = userPool;

		new AuthApi(this, 'AuthServiceApi', {
			userPoolId,
			userPoolClientId,
		});

		new ProtectedApi(this, 'ProtectedApi', {
			userPoolId,
			userPoolClientId,
		});
  }
}
