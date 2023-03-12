import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";
import { CookieMap, createPolicy, parseCookies, verifyToken } from "../utils";

exports.handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("[EVENT]", event);

  //   const cookies: CookieMap = parseCookies(event);
  //   console.log(cookies);
  const cookie = event?.headers?.cookie;

  if (!cookie) {
    console.error("No auth cookies provided!");
    return {
      principalId: "",
      policyDocument: createPolicy(event, "Deny"),
    };
  }

  const verifiedJwt = await verifyToken(
    cookie,
    process.env.USER_POOL_ID!
  );

  return {
    principalId: verifiedJwt ? verifiedJwt.sub!.toString() : "",
    policyDocument: createPolicy(event, verifiedJwt ? "Allow" : "Deny"),
  };
};
