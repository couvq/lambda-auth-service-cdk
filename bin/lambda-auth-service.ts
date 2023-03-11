#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaAuthServiceStack } from '../lib/lambda-auth-service-stack';

const app = new cdk.App();
new LambdaAuthServiceStack(app, 'LambdaAuthServiceStack', {});