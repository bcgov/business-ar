terraform {
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
    }
  }
  required_version = ">= 1.8.0"
}

provider docker {
}

resource docker_image "regapi_image" {
  name = "regapi"
}

resource docker_container "regapi_container" {
  name = "regapi"
  image = docker_image.regapi_image.image_id
  ports {
    internal = 8080
    external = 8080
  }
}

resource docker_image "regweb_image" {
  name = "regweb"
}

resource docker_container "regweb_container" {
  name = "regweb"
  image = docker_image.regweb_image.image_id
  ports {
    internal = 3000
    external = 3000
  }
}


