#!/bin/bash

#Requirements:
#	AWS Cli
#	Serverless
#	jq
#	python3.8-dev

function PopulateConfigFile() #Parameters: Filename
{
    if [ $1 == '.env-production' ]; then
        export CookieDomain=$(TrimUrlToDomain $Domain_Prod)
        export Whitelist=$(UrlToWhitelist $CookieDomain)
        export AssetsDomain=$AssetsDomain_Prod
    elif [ $1 == '.env-candidate' ]; then
        export CookieDomain=$(TrimUrlToDomain $Domain_Cand)
        export Whitelist=$(UrlToWhitelist $CookieDomain)
        export AssetsDomain=$AssetsDomain_Cand
    elif [ $1 == '.env-staging' ]; then
        export CookieDomain=$(TrimUrlToDomain $Domain_Staging)
        export Whitelist=$(UrlToWhitelist $CookieDomain)
        export AssetsDomain=$AssetsDomain_Staging
    else
        export CookieDomain=$(TrimUrlToDomain $Domain_Dev)
        export Whitelist=$(UrlToWhitelist $CookieDomain)
        export AssetsDomain=$AwsBucket
    fi

    RootUrl=""
    CookieUrl=""
    AssetsDomain="$AssetsDomain.s3.amazonaws.com"
    if [ $UseCustomGatewayUrl == 'false' ]; then
        RootUrl="$AwsStage/"
        CookieUrl=$AwsStage
    fi

    sed -i "s>ROOT_URL=>ROOT_URL=\/$RootUrl>" $1
    sed -i "s>ASSETS_BASE_URL=>ASSETS_BASE_URL=https:\/\/$AssetsDomain\/>" $1
    sed -i "s>FASTBOOT_WHITELIST_DOMAIN=>FASTBOOT_WHITELIST_DOMAIN=$Whitelist>" $1
}

function CreatePackage() #Parameters: StageName, BuildNumber
{
    mkdir -p $SvcName-$2-$1/$SvcName/dist
    mkdir dist-$2-$1
    cp .env-$1 $SvcName-$2-$1/.env-$1
    cp deployment/serverless.yml $SvcName-$2-$1/serverless.yml
    cp -r $SvcName/* $SvcName-$2-$1/$SvcName
    cp .env-$1 $SvcName-$2-$1/$SvcName/node/.env
    cp -r dist/$1/* $SvcName-$2-$1/$SvcName/dist
    cp -r dist/$1/* dist-$2-$1
}

function UrlToWhitelist() #Parameters: Url
{
	echo "^$(echo $1 | sed 's/\./\\\\\./g' )$"
}

function TrimUrlToDomain() #Parameters: Url
{
	echo $1 | sed -e "s/.*\/\///" -e "s/\/.*//"
}

"$@"