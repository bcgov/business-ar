variable "hostRootPath" {
  type = string
}

variable "firebase_api_key" {
  type = string
  default = ""
}

variable "firebase_auth_domain" {
  type = string
  default = "business-ar.firebaseapp.com"
}

variable "firebase_project_id" {
  type = string
  default = "business-ar"
}

variable "firebase_storage_bucket" {
  type = string
  default = "business-ar.appspot.com"
}

variable "firebase_messaging_sender_id" {
  type = string
  default = "12345"
}

variable "firebase_app_id" {
  type = string
  default = "12345"
}

variable "auth_api_url" {
  type = string
}

variable "pay_api_url" {
  type = string
}

variable "oidc_issuer" {
  type = string
}

variable "oidc_well_known_config" {
  type = string
}

variable "auth_svc_url" {
  type = string
}

variable "auth_client_id" {
  type = string
}

variable "auth_client_secret" {
  type = string
}

variable "canada_post_api_key" {
  type = string
  default = ""
}

variable "pay_api_version" {
  type = string
  default = "/api/v1"
}

variable "auth_url" {
  type = string
}

variable "auth_realm" {
  type = string
}

variable "registry_home_url"{
  type = string
  default = ""
}


variable "nuxt_client_id" {
  type = string
}