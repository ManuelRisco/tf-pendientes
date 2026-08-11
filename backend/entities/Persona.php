<?php

use Illuminate\Database\Eloquent\Model;

class Persona extends Model {
    protected $table = 'personas';
    protected $fillable = ['nombre', 'apellido'];
    public $timestamps = false; // Asumiendo que no tiene timestamps (si los tiene, cambiar a true)

    public function usuarios() {
        return $this->hasMany(Usuario::class, 'persona_id');
    }
}
