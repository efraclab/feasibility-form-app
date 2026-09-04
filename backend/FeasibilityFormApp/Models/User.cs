namespace FeasibilityFormApp.Models
{
    public class User
    {
        public string EmployeeId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }

        // ROLE_MAST.ROLE_CODE
        // Example: ROLE000020
        public string RoleCode { get; set; }

        // ROLE_MAST.ROLE_NAME
        // Example: CRM Special
        public string Role { get; set; }

        // USERFILE.USERDEPT
        // Example: 020
        public string Department { get; set; }
    }
}