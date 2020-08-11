#!/bin/bash

#Requirements:	
#	AWS Cli	
#	Serverless	
#	jq	
#	python3.8-dev

function SetAwsProfile() 
{
	aws configure set aws_access_key_id $AwsAccessKey --profile $SvcName-$AwsStage
	aws configure set aws_secret_access_key $AwsSecretKey --profile $SvcName-$AwsStage
	aws configure set region $AwsRegion --profile $SvcName-$AwsStage
}

function SetServerlessProfile()
{
	sls config credentials --provider aws --key $AwsAccessKey --secret $AwsSecretKey --profile $SvcName-$AwsStage --overwrite 
}

function GetStageFromBranchName () #Parameters: BranchName
{
	echo $1 | sed -e 's/.*\///' -e "s/-.*//"
}

function TrimUrlToDomain() #Parameters: Url
{
	echo $1 | sed -e "s/.*\/\///" -e "s/\/.*//"
}

function AwsEncrypt () #Parameters: TargetString, KmsKey
{
	echo $(aws kms encrypt --key-id $2 --plaintext "$1" --output text --query CiphertextBlob --profile $SvcName-$AwsStage --region $AwsRegion)
}

function GetGatewayUrl () #Parameters: Platform ("api" or "fastboot")
{
	stage_name=$AwsStage

    aws apigateway get-rest-apis --profile $SvcName-$AwsStage --region $AwsRegion --output json > gateways.json  
	gateway=$( cat gateways.json | jq -r --arg ApiName "$stage_name" --arg Platform "$1" '.items[] | select(.name | startswith($ApiName) and endswith($Platform) ) | .id' )

	#Fall back to master if we don't find a matching api for this branch
	if [ -z $gateway ]; then
		stage_name="master"	
		gateway=$( cat gateways.json | jq -r --arg ApiName "$stage_name" --arg Platform "$1" '.items[] | select(.name | startswith($ApiName) and endswith($Platform) ) | .id' )
	fi

	#If we found an api, append the rest of the url
	if [ -n $gateway ]; then
		gateway=$(echo $gateway | sed "s/\"//g").execute-api.$AwsRegion.amazonaws.com/$stage_name
	fi
	
	rm gateways.json
	echo $gateway
}

function CreatePublicBucket() #Parameters: BucketName
{
	aws s3 ls s3://$1 --profile $SvcName-$AwsStage || aws s3 mb s3://$1 --region $AwsRegion --profile $SvcName-$AwsStage
    aws s3api put-bucket-acl --bucket $1 --acl public-read --profile $SvcName-$AwsStage
}

function CopyToBucket() #Paramters: FolderName, DestinationBucketPath
{
	aws s3 cp $1 s3://$2 --recursive --profile $SvcName-$AwsStage --acl public-read
}

function DeleteBucketFolder() #Parameters: BucketPath
{
	aws s3 rm s3://$1 --recursive --profile $SvcName-$AwsStage
}

"$@"