using FeasibilityFormApp.Repositories;
using FeasibilityFormApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IFeasibilityRepository, FeasibilityRepository>();
builder.Services.AddScoped<IFeasibilityService, FeasibilityService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
