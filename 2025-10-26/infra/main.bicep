@description('ストレージアカウント名（グローバルに一意である必要があります）')
param storageAccountName string = 'stazcopysample${uniqueString(resourceGroup().id)}'

@description('Blobコンテナー名')
param blobContainerName string = 'azcopy-container'

@description('Azure Files共有名')
param fileShareName string = 'azcopy-fileshare'

@description('デプロイメントの場所')
param location string = resourceGroup().location

@description('ストレージアカウントのSKU')
param storageSku string = 'Standard_LRS'

@description('ストレージアカウントの種類')
param storageKind string = 'StorageV2'

@description('アクセス層')
param accessTier string = 'Hot'

@description('Blobコンテナーのパブリックアクセスレベル')
param blobPublicAccess string = 'None'

@description('Azure Filesのクォータ（GB）')
param fileShareQuota int = 100

// ストレージアカウント
resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageSku
  }
  kind: storageKind
  properties: {
    accessTier: accessTier
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      defaultAction: 'Allow'
    }
  }

}

// Blobサービス（独立したリソース）
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  
  resource blobContainer 'containers' = {
    name: blobContainerName
    properties: {
      publicAccess: blobPublicAccess
      metadata: {
        description: 'AzCopyサンプル用のBlobコンテナー'
      }
    }
  }
}

// ファイルサービス（独立したリソース）
resource fileService 'Microsoft.Storage/storageAccounts/fileServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'

  resource fileShare 'shares' = {
    name: fileShareName
    properties: {
      accessTier: 'TransactionOptimized'
      enabledProtocols: 'SMB'
      shareQuota: fileShareQuota
      metadata: {
        description: 'AzCopyサンプル用のAzure Files共有'
      }
    }
  }
}

// 出力値
output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
output blobContainerName string = blobService::blobContainer.name
output blobContainerUrl string = 'https://${storageAccount.name}.blob.core.windows.net/${blobService::blobContainer.name}'
output fileShareName string = fileService::fileShare.name
output fileShareUrl string = 'https://${storageAccount.name}.file.core.windows.net/${fileService::fileShare.name}'
output primaryEndpoints object = storageAccount.properties.primaryEndpoints
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
