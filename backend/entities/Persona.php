<?php

use Illuminate\Database\Eloquent\Model;

class Persona extends Model {
    protected $table = 'personas';
    protected $fillable = ['nombre', 'apellido'];
    public $timestamps = false;

    public function usuarios() {
        return $this->hasMany(Usuario::class, 'persona_id');
    }
}
