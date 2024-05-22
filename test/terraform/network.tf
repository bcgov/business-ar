resource "docker_network" "private_network" {
  name = "reg_vnet"
  ipam_config{
    subnet = "173.25.0.0/14"
  }
}