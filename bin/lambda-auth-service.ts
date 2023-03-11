#!/usr/bin/env node
import "source-map-support/register";
import { LambdaAuthServiceStack } from "../lib/lambda-auth-service-stack";
import { App } from "aws-cdk-lib";

const app = new App();
new LambdaAuthServiceStack(app, "LambdaAuthServiceStack", {});
