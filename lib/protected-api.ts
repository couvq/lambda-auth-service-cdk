import { Duration } from 'aws-cdk-lib';
import { RestApi, EndpointType, Cors, AuthorizationType,
    IdentitySource, LambdaIntegration, RequestAuthorizer, LogGroupLogDestination, AccessLogFormat,
} from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type ProtectedApiProps = {
	userPoolId: string;
	userPoolClientId: string;
};

export class ProtectedApi extends Construct {
	constructor(scope: Construct, id: string, props: ProtectedApiProps) {
		super(scope, id);

        const logsOfApiGateway = new LogGroup(this, "ApiGatewayLogs");

		const api = new RestApi(this, 'ProtectedApi', {
			description: 'Protected RestApi',
			endpointTypes: [EndpointType.REGIONAL],
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
			},
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(logsOfApiGateway),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields();
            }
		});

		const protectedRes = api.root.addResource('protected');

		const commonFnProps = {
			runtime: Runtime.NODEJS_16_X,
			handler: 'handler',
			environment: {
				USER_POOL_ID: props.userPoolId,
				CLIENT_ID: props.userPoolClientId,
			},
		};

		const protectedFn = new NodejsFunction(this, 'ProtectedFn', {
			...commonFnProps,
			entry: './lambda/protected.ts',
		});

		const authorizerFn = new NodejsFunction(this, 'AuthorizerFn', {
			...commonFnProps,
			entry: './lambda/auth/authorizer.ts',
		});

		const requestAuthorizer = new RequestAuthorizer(this, 'RequestAuthorizer', {
			identitySources: [IdentitySource.header('cookie')],
			handler: authorizerFn,
			resultsCacheTtl: Duration.minutes(0),
		});

		protectedRes.addMethod('GET', new LambdaIntegration(protectedFn), {
			authorizer: requestAuthorizer,
			authorizationType: AuthorizationType.CUSTOM,
		});
	}
}