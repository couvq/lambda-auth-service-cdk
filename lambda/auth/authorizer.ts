import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { CookieMap, createPolicy, parseCookies, verifyToken } from "../utils";

const cognito = new CognitoIdentityServiceProvider();

exports.handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("[EVENT]", event);

  const cookies: CookieMap = parseCookies(event);
  console.log(cookies);

  if (!cookies) {
    console.error("No auth cookies provided!");
    return {
      principalId: "",
      policyDocument: createPolicy(event, "Deny"),
    };
  }

  const verifiedJwt = await verifyToken(
    cookies.token,
    process.env.USER_POOL_ID!
  );

  return {
    principalId: verifiedJwt ? verifiedJwt.sub!.toString() : "",
    policyDocument: createPolicy(event, verifiedJwt ? "Allow" : "Deny"),
  };
};
