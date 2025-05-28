variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "key_pair_name" {
  description = "global"
  type        = string
}

variable "db_username" {
  description = "global"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "global(keep this secret!)"
  type        = string
  sensitive   = true
}
