<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model {
    use SoftDeletes;
    
    protected $table = 'usuarios';
    protected $fillable = ['persona_id', 'rol_id', 'email', 'password'];
    
    // Asumiendo que la base de datos tiene campos created_at, updated_at
    public $timestamps = true;

    // Ocultar password de serialización por seguridad
    protected $hidden = ['password'];

    public function persona() {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function rol() {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function tareasAsignadas() {
        return $this->hasMany(Tarea::class, 'asignado_a');
    }

    public function tareasCreadas() {
        return $this->hasMany(Tarea::class, 'creado_por');
    }
}
